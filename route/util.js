module.exports.sendResponse = (res, message, error) => {
  /* Here e create the status code to send to the client depending on whether
  or not the error being passed in is nukk. Then, we create and send
  the json object response to the client */
  res
    .status(error != null ? error != null ? 400 : 200 : 400)
    .json({
      message: message,
      error: error,
    })
}