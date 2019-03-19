const request = require("request");

var GSheetURL = "{YOUR_SPREADSHEET_SCRIPT_URL}";

exports.helloWorld = (req, res) => {
    console.log(req.body.queryResult.parameters);

    var params = req.body.queryResult.parameters;

    if(params["ClubName"]){//団体名があった場合
      request.post(
        {
          uri: GSheetURL,
          headers: { "Content-type" : "application/json" },
          json:{
            "Club" : params["ClubName"]
          },
          followAllRedirects: true, //from: https://qiita.com/comefigo/items/984d77840328d3ab8248
        },
        function(error,response,body){
          if (!error && response.statusCode == 200) {
            console.log("body = ");
            console.log(body);

            var searched = body["result"];
            searched = searched.filter(x => x !== 0);

            console.log(searched);

            var ret = {};

            if(searched.length != 0){
              var Cards = [];
              searched.forEach(element => {
                Cards.push(MakeCard(element));
              });

              if(searched[0][["更新日時"]]){
  
                Cards.unshift({
                  "text":{
                    "text":[
                      searched[0]["更新日時"]　+ "の" + searched[0]["団体名"] + "の情報です。"
                    ] 
                  }
                });
              }
              else {
                Cards.unshift({
                  "text":{
                    "text":[
                      searched[0]["団体名"] + "の情報です。"
                    ] 
                  }
                });
              }
  
  
              ret = {
                "fulfillmentText": "",
                "fulfillmentMessages": Cards
              }
            }
            else{
              res.status(200).send();
            }
            
            /*
            ret = {
              "fulfillmentText": SheetJSON2String(body),
              "fulfillmentMessages": [
                {
                  "text":{
                    "text":[
                      body["更新日時"]　+ "の" + body["団体名"] + "の情報です。"
                    ]
                  }
                },
                {
                  "card": {
                    "title": body["店名"],
                    "subtitle": body["団体名"] + "・" + body["種別"] + "\n"
                              + "残量:" + body["残量"] + "\n"
                              + "行列:" + body["行列"],
                    "buttons": [
                      {
                        "text": "地図を見る",
                        "postback": body["フロアガイド"]
                      }
                    ]
                  }
                },
              ]
            };*/
  
            console.log("ret =");
            console.log(ret);
  
            res.status(200).send(JSON.stringify(ret));
        }
        else{
          console.log("GSheetAccess Failed");
          res.status(500).send(JSON.stringify({"fulfillmentText": "GSheetAccess Failed"}));
        }
        }
      );
    }
  };

  function MakeCard (txt){
    if(txt["団体種"] == "飲食団体"){
      return {
        "card": {
          "title": txt["店名"],
          "subtitle": txt["団体名"] + "・" + txt["種別"] + "\n"
                    + "残量:" + txt["残量"] + "\n"
                    + "行列:" + txt["行列"],
          "buttons": [
            {
              "text": "地図を見る",
              "postback": "https://harvest71st.github.io/Guides?locate=Corridor"
            },
          ]
        }
      };
    }
    else if(txt["団体種"] == "展示団体"){
      return {
        "card": {
          "title": txt["店名"],
          "subtitle": txt["団体名"] + "・" + txt["業種"] + "\n"
                    + "場所:" + txt["場所"],
          "buttons": [
            {
              "text": "地図を見る",
              "postback": txt["フロアガイド"]
            },
          ]
        }
      };
    }
    else if(txt["団体種"] == "イベント"){
      return {
        "card": {
          "title": txt["名称"],
          "subtitle": txt["団体名"] + "\n"
                    + "場所:" + txt["場所"]　+ "\n"
                    + "時間:" + txt["時間"],
          "buttons": [
            {
              "text": "地図を見る",
              "postback": "https://harvest71st.github.io/Guides"
            },
          ]
        }
      };
    }
  }