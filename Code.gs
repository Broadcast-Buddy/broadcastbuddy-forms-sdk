// Create a form submit trigger
function createFormSubmitTrigger() {
  const form = FormApp.getActiveForm();
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();
}

function onOpen() {
  FormApp.getUi().createAddonMenu().addItem('Setup', 'show_setup').addToUi();
}

function show_setup() {
  const html = HtmlService.createTemplateFromFile('setup').evaluate().setTitle("Broadcast Buddy - Add-on");
  FormApp.getUi().showSidebar(html);
}

function onFormSubmit() {
  let waResponse = sendWhatsApp();
  Logger.log(waResponse);
  let emailResponse = sendEmail();
  Logger.log(emailResponse);
  let smsResponse = sendSMS();
  Logger.log(smsResponse);
}

function setProperty(key, value) {
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty(key, value);
}

function getProperty(key) {
  var scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty(key);
}

function readProperties() {
  var scriptProperties = PropertiesService.getScriptProperties();
  Logger.log(scriptProperties.getProperties());
  return scriptProperties.getProperties();
}

function getFields() {
  // Fields
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteProperty('fields');

  const TotalFields = FormApp.getActiveForm().getItems().length;
  var fields = [];
  for (let i = 0; i < TotalFields; i++) {
    let title = FormApp.getActiveForm().getItems()[i].getTitle(); // Get the title of the field
    let index = FormApp.getActiveForm().getItems()[i].getIndex(); // Get the index of the field
    fields.push({ 'title': title, 'index': index });
  }
  setProperty('fields', JSON.stringify(fields));
  Logger.log(JSON.stringify(fields));
}

function sendWhatsApp() {
  const form = FormApp.getActiveForm();
  const formResponses = form.getResponses();
  const latestFormResponse = formResponses[formResponses.length - 1];
  const itemResponses = latestFormResponse.getItemResponses();

  // Get the responses from the form
  const body = {
    "recipient": itemResponses[getProperty('contactField')].getResponse(),
  };

  // Replace with the actual phone number (you could also capture this from the form)
  const recipient = body.recipient;  // Replace with the recipient's phone number

  // Construct the message using the form responses
  const message = getProperty('messageField');

  // API endpoint for sending WhatsApp messages
  const url = 'https://api.broadcastbuddy.app/v1/whatsapp/compose/text'; // Replace with your actual API endpoint

  // Prepare the data to be sent in the POST request
  const payload = {
    'receiver_type': 'user',
    'recipient': recipient,  // Phone number of the recipient
    'message': message       // Message content
  };

  // Set the request options for a POST request
  var options = {
    'method': 'POST',
    'headers': { 'X-Authorization': String(getProperty('whatsappApiToken')) }, // Adding x-authorization header correctly
    'contentType': 'application/json',
    'payload': JSON.stringify(payload)  // Send data as JSON
  };

  // Send the POST request to the WhatsApp API
  try {
    var response = UrlFetchApp.fetch(url, options);
    Logger.log(response.getContentText());  // Log the response from the API
    return response.getContentText();
  } catch (error) {
    Logger.log("Error: " + error.message);  // Log any errors
    return "Error: " + error.message;
  }
}

function sendEmail() {
  const form = FormApp.getActiveForm();
  const formResponses = form.getResponses();
  const latestFormResponse = formResponses[formResponses.length - 1];
  const itemResponses = latestFormResponse.getItemResponses();

  // Get the responses from the form
  const body = {
    "email": itemResponses[getProperty('emailField')].getResponse(),
  };

  // Replace with the actual phone number (you could also capture this from the form)
  const recipient = body.email;  // Replace with the recipient's phone number

  // Construct the message using the form responses
  const message = getProperty('messageField');

  // API endpoint for sending WhatsApp messages
  const url = 'https://api.broadcastbuddy.app/v1/email/send'; // Replace with your actual API endpoint

  // Prepare the data to be sent in the POST request
  const payload = {
    'subject': getProperty('subject'),
    'receiver': recipient,  // Phone number of the recipient
    'message': message       // Message content
  };

  // Set the request options for a POST request
  var options = {
    'method': 'POST',
    'headers': { 'X-Authorization': String(getProperty('emailApiToken')) }, // Adding x-authorization header correctly
    'contentType': 'application/json',
    'payload': JSON.stringify(payload)  // Send data as JSON
  };

  // Send the POST request to the Email API
  try {
    var response = UrlFetchApp.fetch(url, options);
    Logger.log(response.getContentText());  // Log the response from the API
    return response.getContentText();
  } catch (error) {
    Logger.log("Error: " + error.message);  // Log any errors
    return "Error: " + error.message;
  }
}


function sendSMS() {
  const form = FormApp.getActiveForm();
  const formResponses = form.getResponses();
  const latestFormResponse = formResponses[formResponses.length - 1];
  const itemResponses = latestFormResponse.getItemResponses();

  // Get the responses from the form
  const body = {
    "contact": itemResponses[getProperty('contactField')].getResponse(),
  };

  // Replace with the actual phone number (you could also capture this from the form)
  const recipient = body.contact;  // Replace with the recipient's phone number
  // Construct the message using the form responses
  const message = getProperty('messageField');
  const api_key = getProperty('smsApiToken');
  const sender_id = getProperty('smsSenderID');

  // API endpoint for sending WhatsApp messages
  const url = 'https://api.broadcastbuddy.app/v1/sms/send?api_key='+api_key+'&contact='+recipient+'&message='+message+'&sender_id='+sender_id; // Replace with your actual API endpoint

  // Set the request options for a POST request
  var options = {
    'method': 'GET'
  };

  // Send the POST request to the SMS API
  try {
    var response = UrlFetchApp.fetch(url, options);
    Logger.log(response.getContentText());  // Log the response from the API
    return response.getContentText();
  } catch (error) {
    Logger.log("Error: " + error.message);  // Log any errors
    return "Error: " + error.message;
  }
}
