import R from 'ramda';
import omitEmpty from 'omit-empty';

const notificationHeaderValue = R.curry((notification, header) =>
  R.pipe(
    R.path(['mail', 'headers']),
    R.find(R.propEq('name', header)),
    R.prop('value')
  )(notification)
);

const payloadHeadersMapping = {
  userId: 'X-Moonmail-User-ID',
  listId: 'X-Moonmail-List-ID',
  recipientId: 'X-Moonmail-Recipient-ID',
  segmentId: 'X-Moonmail-Segment-ID',
  campaignId: 'X-Moonmail-Campaign-ID'
};

const payloadNotificationMapping = {
  Complaint: { feedbackType: ['complaint', 'complaintFeedbackType'] },
  Bounce: {
    bounceType: ['bounce', 'bounceType'],
    bounceSubType: ['bounce', 'bounceSubType']
  },
  Delivery: {}
};

const notificationTypeMapping = {
  Delivery: 'email.delivered',
  Complaint: 'email.reported',
  Bounce: 'email.bounced'
};

const buildPayloadFromNotification = function buildPayloadFromNotification(sesNotification = {}) {
  const headerValue = notificationHeaderValue(sesNotification);
  const headerPayload = Object.keys(payloadHeadersMapping).reduce((acc, key) => {
    const newObj = { [key]: headerValue(payloadHeadersMapping[key]) };
    return Object.assign({}, acc, newObj);
  }, {});
  const notifycationPayload = Object.keys(payloadNotificationMapping[sesNotification.notificationType]).reduce((acc, key) => {
    const val = R.path(payloadNotificationMapping[sesNotification.notificationType][key], sesNotification);
    const newObj = { [key]: val };
    return Object.assign({}, acc, newObj);
  }, {});
  return omitEmpty(Object.assign({}, headerPayload, notifycationPayload));
};

const fromSesNotification = function eventFromSesNotification(sesNotification = {}) {
  const payload = buildPayloadFromNotification(sesNotification);
  return {
    type: notificationTypeMapping[sesNotification.notificationType],
    payload
  };
};

export default {
  fromSesNotification
};
