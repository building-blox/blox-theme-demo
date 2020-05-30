const path = require("path");

module.exports = {
  paths: {
    project: path.join(__dirname, "../../"),
    templates: `${path.join(__dirname, "../../")}src/templates`,
    pages: `${path.join(__dirname, "../../")}src/templates/pages`,
    components: `${path.join(__dirname, "../../")}src/templates/components`,
    componentStyles: `${path.join(__dirname, "../../")}src/assets/scss/dist`,
    data: `${path.join(__dirname, "../../")}src/data`,
    public: `${path.join(__dirname, "../../")}public`,
  },
};
