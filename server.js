const snoowrap = require("snoowrap");
const express = require("express");
const app = express();
// const bodyParser = require("body-parser");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").load();
}

app.set("view engine", "ejs");
app.use(express.static("public"));
// app.use(bodyParser.urlencoded({ extended: true }));
console.log(process.env);
const r = new snoowrap({
  userAgent: "read-me-a-story",
  clientId: "iOU5tebeB2brrg",
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  refreshToken: process.env.REDDIT_REFRESH_TOKEN
});

app.get("/", function(req, res) {
  res.render("index", { threadTitle: null, comments: null });
});

app.post("/", function(req, res) {
  console.log("post");
  let threadTitle = "";
  r.getSubreddit("writingprompts")
    .getHot({ limit: 1 })
    .filter(_ => _.stickied === false)
    .forEach(function(val) {
      threadTitle = val.title;
      console.log(val.title);
      console.log(val.comments.length);

      val.expandReplies({ depth: 1, limit: 1 }).then(function(sub) {
        console.log(sub.comments.length);
        const comments = sub.comments
          .filter(_ => _.stickied === false)
          .sort(function(a, b) {
            return a.ups > b.ups;
          })
          .map(_ => _.body_html);
        comments.forEach(function(comment) {
          comments.push(comment);
        });

        res.render("index", { threadTitle: threadTitle, comments: comments });
      });
    });
});

app.listen(3000, function() {
  console.log("Example app listening on port 3000");
});
