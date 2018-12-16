const snoowrap = require("snoowrap");
const express = require("express");
const app = express();
if (process.env.NODE_ENV !== "production") {
  require("dotenv").load();
}

app.set("view engine", "ejs");
app.use(express.static("public"));
const r = new snoowrap({
  userAgent: "read-me-a-story",
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  refreshToken: process.env.REDDIT_REFRESH_TOKEN
});

app.get("/", function(req, res) {
  res.render("index", { threadTitle: null, comment: null, threadLink: null });
});

app.post("/", function(req, res) {
  console.log("post");
  let threadTitle = "";
  let threadLink = "";

  r.getSubreddit("writingprompts")
    .getHot({ limit: 1 })
    .filter(_ => !_.stickied && _.num_comments >= 5)
    .forEach(function(val) {
      threadTitle = val.title.replace("[WP]", "");
      threadLink = val.permalink;
      console.log(val.title);
      console.log(val.comments.length);

      val.expandReplies({ depth: 1, limit: 1 }).then(function(sub) {
        console.log(sub.comments.length);
        var comments = sub.comments
          .filter(_ => !_.stickied && !_.removed)
          .sort(function(a, b) {
            return a.ups > b.ups;
          })
          .map(function(comment) {
            return {
              text: comment.body_html,
              link: comment.id,
              author: comment.author.name
            };
          });
        var comment = comments[Math.floor(Math.random() * comments.length)];
        res.render("index", {
          threadTitle: threadTitle,
          comment: comment,
          threadLink: threadLink
        });
      });
    });
});

app.listen(process.env.PORT || 5000);
