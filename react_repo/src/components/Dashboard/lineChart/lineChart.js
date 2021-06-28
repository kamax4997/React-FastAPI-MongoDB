import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "./lineChart.scss";
import md5 from "spark-md5";

export const LineChartCollapse = ({ lineCharData }) => {
  let colorGrid = [];
  for (var l in lineCharData["labels"]) {
    colorGrid.push("rgba(235,235,235,1)");
  }

  const [colorSet, setColorSet] = useState([]);

  useEffect(() => {
    let newColorSet = [];
    lineCharData["datasets"].forEach((set) => {
      /* compute hash from the url */
      let urlHash = md5.hash(set.label);
      let colors = [
        parseInt(urlHash.slice(0, 2), 16),
        parseInt(urlHash.slice(2, 4), 16),
        parseInt(urlHash.slice(4, 6), 16),
      ];
      /* create colors from the computed hash */
      let hashedColors = [
        `rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 0.25)`,
        `rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 1)`,
      ];
      newColorSet.push(hashedColors);
    });
    setColorSet(newColorSet);
  }, [lineCharData]);

  const options = {
    customOffset: 1,
    responsive: true,
    defaultFontFamily: "'Baloo Thambi 2', cursive",
    maintainAspectRatio: false,
    tooltips : {
      mode : "point",
      titleFontFamily: "'Baloo Thambi 2', cursive",
      titleFontSize: 14,
      bodyFontFamily: "'Baloo Thambi 2', cursive",
      bodyFontSize: 14,
      caretSize: 8,
      xPadding: 8,
      yPadding: 8,
      callbacks: {
        labelColor: function (context) {
          return {
            backgroundColor: colorSet[context.datasetIndex][1],
          };
        }
      }
    },
    hover: {
      intersect: true,
    },
    legend: {
      display: false,
    },
    elements: {
      point: {
        borderWidth: 5,
        hitRadius: 1,
        backgroundColor: "rgba(255, 255, 255, 1)",
        radius: 5,
        pointRadius: 5,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          //   labelColor: (TooltipItem, Chart) => {
          //     console.log("render color")
          //     return "#5f2d2f"
          //   },
          //   labelTextColor: function(context) {
          //     return '#543453';
          // }
          labelColor: function (context) {
            console.log(colorSet);
            return {
              borderColor: "rgb(0, 0, 255)",
              backgroundColor: "rgb(255, 0, 0)",
              borderWidth: 2,
              borderDash: [2, 2],
              borderRadius: 2,
            };
          },
        },
      },
    },
    scales: {
      xAxes: [
        {
          suggestedMax: 1000,
          display: true,
          grace: "5%",
          scaleLabel: {
            display: true,
          },
          gridLines: {
            drawOnChartArea: false,
            color: colorGrid,
            zeroLineColor: "rgba(0, 0, 0, 0)",
            offset: true,
          },
          ticks: {
            fontColor: "#7F83A1",
            lineHeight: 1.5,
            padding: 5,
            labelOffset: 5,
            autoSkip: false,
            maxRotation: 30,
            minRotation: 30,
            fontFamily: "'Baloo Thambi 2', cursive",
            fontSize: 13,
          },
        },
      ],
      yAxes: [
        {
          suggestedMax: 1000,
          display: true,
          scaleLabel: {
            display: true,
          },
          gridLines: {
            drawOnChartArea: true,
            color: colorGrid,
            zeroLineColor: "rgba(0, 0, 0, 0)",
            offset: true,
          },
          ticks: {
            precision: 0,
            fontColor: "#7F83A1",
            lineHeight: 1.5,
            padding: 5,
            beginAtZero: true,
            fontFamily: "'Baloo Thambi 2', cursive",
            fontSize: 13,
          },
        },
      ],
    },
  };

  const data = (canvas) => {
    const ctx = canvas.getContext("2d");
    let lineIndex = 0;

    for (var line of lineCharData["datasets"]) {
      const gradient = ctx.createLinearGradient(0, 0, 500, 0);
      gradient.addColorStop(0, colorSet[lineIndex][0]);
      gradient.addColorStop(1, colorSet[lineIndex][1]);
      line["borderColor"] = gradient;
      line["pointBackgroundColor"] = "rgba(255, 255, 255, 1)";
      line["pointHoverBackgroundColor"] = "rgba(255, 255, 255, 1)";
      line["borderWidth"] = 2;
      line["hoverBorderWidth"] = 2;
      line["shadowOffsetX"] = 0;
      line["shadowOffsetY"] = 11;
      line["shadowBlur"] = 6;
      line["shadowColor"] = "rgba(255, 4, 68, 0.08)";
      line["pointShadowOffsetX"] = 0;
      line["pointShadowOffsetY"] = 4;
      line["pointShadowBlur"] = 4;
      line["pointShadowColor"] = "rgba(0, 0, 0, 0.04)";

      lineIndex++;
    }

    return lineCharData;
  };
  if (colorSet.length === lineCharData["datasets"].length) {
    return <Line data={data} options={options} />;
  } else {
    return <></>;
  }
};
