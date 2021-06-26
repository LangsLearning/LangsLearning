const logger = require('../logger'),
ejs = require('ejs'),
path = require('path'),
_ = require('lodash'),
{ serverConfig } = require('../config'),
moment = require('moment'),
ClassTemplate = require('./class_template'),
{ Teacher } = require('../teacher'),
Handler = require('../handler');

const renderClassTemplatesPage = new Handler(async(req, res) => {
  const templates = await ClassTemplate.findAll();
  res.render('admin_class_templates', { templates });

}).onErrorRender('admin_classes', err => ({ template_classes: []}));

const getClassesTemplatesJson = new Handler(async(req, res) => {
  const templates = await ClassTemplate.findAll();
  logger.info(`Rendering admin classes page: ${classesWithTeacher.length} classes found, ${teachers.length} teachers available`);
  res.status(200).json(templates);

}).onErrorRespondJson(500);

const registerClassTemplate = new Handler(async(req, res) => {
  const template = { title, description, level, materialLink } = req.body;
  if (!title || !description || !level || !materialLink) {
    logger.error(`Invalid class template data to be registered, ${JSON.stringify(req.body)}`);
    res.redirect('/admin/class_templates');
    return;
  }

  const registered = await ClassTemplate.register(template);
  logger.info(`Class Template ${JSON.stringify(registered)} registered`);
  res.redirect('/admin/class_templates');

}).onErrorRedirect('/admin/class_templates');

module.exports = {
  renderClassTemplatesPage,
  getClassesTemplatesJson,
  registerClassTemplate,
};
