export const shortenLink = async (longUrl, options) => {
  /* 
    API Parameters
        long_url
        domain_name
        input_desired_keyword
        time_limit
        click_limit
        go_rougue
        not_child
        not_work
        contains_politics
        contains_promotions
        contains_violence
  */
  
  let data = {
      long_url: longUrl,
      ...(options?.domainName && { domain_name: options.domainName }),
      ...(options?.inputDesiredKeyword && { input_desired_keyword: options.inputDesiredKeyword }),
      ...(options?.timeLimit && { time_limit: options.timeLimit }),
      ...(options?.clickLimit && { click_limit: options.clickLimit }),
      ...(options?.goRogue && { go_rougue: options.goRogue }),
      ...(options?.notChild && { not_child: options.notChild }),
      ...(options?.notWork && { not_work: options.notWork }),
      ...(options?.containsPolitics && { contains_politics: options.containsPolitics }),
      ...(options?.containsPromotions && { contains_promotions: options.containsPromotions }),
      ...(options?.containsViolence && { contains_violence: options.containsViolence }),
  }

  let headers = {
      "secret-key": process.env.REACT_APP_SECRET,
      "Content-Type": "text/plain",
  };
};
