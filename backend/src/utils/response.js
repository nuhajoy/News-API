function buildBaseResponse(success, message, object = null, errors = null) {
  return {
    Success: success,
    Message: message,
    Object: object,
    Errors: errors,
  };
}

function buildPaginatedResponse(message, objects, pageNumber, pageSize, totalSize) {
  return {
    Success: true,
    Message: message,
    Object: objects,
    PageNumber: pageNumber,
    PageSize: pageSize,
    TotalSize: totalSize,
    Errors: null,
  };
}

module.exports = {
  buildBaseResponse,
  buildPaginatedResponse,
};

