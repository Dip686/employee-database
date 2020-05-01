const express = require('express'),
  app = express(),
  cors = require('cors'),
  bodyParser = require('body-parser'),
  data = {
    "userSet": [],
    "roleOption": ["Developer", "Sales", "QA", "Admin", "Manager", "CEO", "CTO", "Lead"]
  };
app.use(cors());
app.use(bodyParser.json());

app.get('/data', function (req, res) {
  res.send(data);
});

app.post('/roleoption', function (req, res) {
  if (req.body.roleOption) {
    data.roleOption = req.body.roleOption;
  }
});
app.post('/userset', function (req, res) {
  if (req.body.userSet) {
    data.userSet = req.body.userSet;
  }
});

app.listen(3000);