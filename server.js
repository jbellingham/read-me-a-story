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

app.post("/", async function(req, res) {
  let threadTitle = "";
  let threadLink = "";

  let posts = await r
    .getSubreddit("writingprompts")
    .getHot({ limit: 20 })
    .filter(_ => !_.stickied && _.num_comments >= 5);

  let val = posts[Math.floor(Math.random() * posts.length)];
  threadTitle = val.title.replace("[WP]", "");
  threadLink = val.permalink;

  val.expandReplies({ depth: 1, limit: 1 }).then(function(sub) {
    console.log(sub.comments.length);
    var comments = sub.comments
      .filter(
        _ =>
          !_.stickied &&
          (!_.body.includes("[removed]") || !_.removed) &&
          !_.body.toLowerCase().includes("i'm a bot")
      )
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
  // });
});

app.listen(process.env.PORT || 5000);
