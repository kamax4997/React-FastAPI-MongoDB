from operator import itemgetter
from datetime import datetime, timedelta
from pymongo import MongoClient
from app.utils import useragent_parser, radom_color, rand_col, rand_rgb_color


def agg_dashboard(db: MongoClient, user_id: str, long_url: str, short_url: str):
    match_condition = {"user_id": user_id,
                       "longitude": {"$exists": True, "$ne": None},
                       "latitude": {"$exists": True, "$ne": None},
                       "deleted": {"$exists": False}}
    if long_url and short_url:
        match_condition["long_url"] = long_url
        # Since mini_link from "short" collection doesn't have the protocal (http|https) then need to match both http and https
        match_condition["short_url"] = {"$in": ["http://"+short_url, "https://"+short_url]}

    pipeline = [
        {
            "$match": match_condition
        },
        {
            "$addFields": {"ts": {"$toDate": {"$multiply": ["$time_stamp", 1000]}}}
        },
        {
            "$project": {"short_url": {"$replaceAll": {"input": {"$replaceAll": {"input": "$short_url",
                                                                                 "find": "https://",
                                                                                 "replacement": ""}},
                                                       "find": "http://",
                                                       "replacement": ""}},
                         "long_url": 1,
                         "city": 1,
                         "time_stamp": 1,
                         "longitude": 1,
                         "latitude": 1,
                         "user_agent": 1,
                         "ts_date": {"$dateFromParts": {"year": {"$year": "$ts"},
                                                        "month": {"$month": "$ts"},
                                                        "day": {"$dayOfMonth": "$ts"}}}},
        },
        {
            "$group": {
                "_id": {"short_url": "$short_url",
                        "long_url": "$long_url",
                        "ts_date": "$ts_date"},
                "count": {"$sum": 1},
                "longlat": {"$push": {"lat": "$latitude",
                                      "long": "$longitude",
                                      "user_agent": "$user_agent",
                                      "url": "$short_url",
                                      "city": "$city"}}
            }
        },
        {
            "$group": {
                "_id": {"ts_date": "$_id.ts_date"},
                "counts": {"$push": {"url": "$_id.short_url",
                                     "long_url": "$_id.long_url",
                                     "count": "$count"}},
                "longslats": {"$push": "$longlat"}
            }
        },
        {
            "$sort": {"_id.ts_date": -1}
        },
        {
            "$project": {"_id": 0,
                         "ts_date": "$_id.ts_date",
                         "longslats": "$longslats",
                         "counts": "$counts"}
        }
    ]
    result = list(db["link_performance"].aggregate(pipeline, allowDiskUse=True))

    pipeline_2 = [
        {
            "$match": {"user_id": user_id,
                       "deleted": {"$exists": False}}
        },
        {
            "$project": {"mini_link": 1,
                         "long_url": 1,
                         "validity": 1,
                         "time_limit": 1,
                         "click_limit": 1,
                         "last_clicked_on": 1,
                         "not_child": 1,
                         "not_work": 1,
                         "contains_politics": 1,
                         "contains_promotions": 1,
                         "contains_violence": 1,
                         "date_time": 1}
        },
        {
            "$addFields": {"datetime_text": {"$substr": ["$date_time", 0, 11]}}
        }
    ]
    urls = list(db["short"].aggregate(pipeline_2, allowDiskUse=True))

    # Data for Line Chart
    labels = list()

    links = []
    seen_link = {}

    all_urls = {}
    datasets = {}

    # Data for Leaflet Map
    mapdatasets = {}

    # Color for all
    colors = {}
    seen_colors = {}

    date_format = "%d %b %Y"

    urls_within_ts = []
    urls_without_ts = []
    for url in urls:
        if url["datetime_text"]:
            url["ts"] = datetime.strptime(url["datetime_text"], "%Y-%b-%d")
            urls_within_ts.append(url)
        else:
            url["ts"] = ""
            urls_without_ts.append(url)

    urls_within_ts = sorted(urls_within_ts, key=itemgetter("ts"), reverse=True)

    for u in urls_within_ts + urls_without_ts:
        date_txt = u["date_time"].split(" ")[0] if u.get("date_time") else ""
        if u['mini_link'] not in seen_link:
            seen_link[u['mini_link']] = 1
            links.append({"short_url": u['mini_link'],
                          "long_url": u["long_url"],
                          "validity": u["validity"] if ("validity" in u) else None,
                          "time_limit": u["time_limit"] if ("time_limit" in u) else None,
                          "click_limit": u["click_limit"] if ("click_limit" in u) else None,
                          "last_clicked_on": u["last_clicked_on"] if ("last_clicked_on" in u) else None,
                          "not_child": u["not_child"] if ("not_child" in u) else None,
                          "not_work": u["not_work"] if ("not_work" in u) else None,
                          "contains_politics": u["contains_politics"] if ("contains_politics" in u) else None,
                          "contains_promotions": u["contains_promotions"] if ("contains_promotions" in u) else None,
                          "contains_violence": u["contains_violence"] if ("contains_violence" in u) else None,
                          "date": date_txt})

    for r in result:
        date_txt = datetime.strftime(r["ts_date"], date_format)
        labels.append(date_txt)
        for c in r["counts"]:
            if c["url"] not in all_urls:
                color = radom_color()
                while color in seen_colors:
                    color = radom_color()
                seen_colors[color] = 1
                all_urls[c["url"]] = {"long_url": c["long_url"],
                                      "color": color,
                                      "date": date_txt}

        if len(result) == 1:
            next_date_txt = datetime.strftime(r["ts_date"] + timedelta(days=1), date_format)
            labels.insert(0, next_date_txt)
    if len(result) == 0:
        labels.append(datetime.strftime(datetime.now(), date_format))

    for url in all_urls:
        item = {"label": url,
                "data": [0] * len(labels),
                "date": all_urls[url]["date"],
                # For styling
                "fill": False,
                "color": all_urls[url]["color"],
                "pointRadius": []}
        datasets[url] = item
        mapdatasets[url] = {"data": {}}
        colors[url] = all_urls[url]["color"]

    for i, r in enumerate(result):
        ts_date = datetime.strftime(r["ts_date"], date_format)
        for count in r["counts"]:
            if count["url"] in datasets:
                item = datasets[count["url"]]
                item["data"][labels.index(ts_date)] += count["count"]
                item["pointRadius"].append(4 if count["count"] > 0 else 0)
                datasets[count["url"]] = item

        for lls in r["longslats"]:
            for ll in lls:
                map_url = mapdatasets[ll["url"]]["data"]
                key_latlong = "%s:%s" % (ll["lat"], ll["long"])

                if key_latlong not in map_url:
                    map_url[key_latlong] = {"date": {},
                                            "lat": ll["lat"],
                                            "long": ll["long"],
                                            "color": colors.get(ll["url"]),
                                            "city": ll["city"]}
                # User clicked counting
                if ts_date not in map_url[key_latlong]["date"]:
                    map_url[key_latlong]["date"][ts_date] = 0
                map_url[key_latlong]["date"][ts_date] += 1

                # Determine which icon should be use
                u_agent = useragent_parser(ll["user_agent"])
                map_url[key_latlong]["device"] = u_agent.device
    '''
        Note:
         - Marker per url

        urls: dict
            - lat:long: dict
                - date: dict
                    - day:
                        - count: int
                - lat: str
                - long: str

    '''

    return {"linechart_datasets": {"labels": labels,
                                   "datasets": list(datasets.values())},
            "map_datasets": mapdatasets,
            "urls": links}
