from couchers.jobs.enqueue import queue_job
from couchers.models import Notification, NotificationPriority
from proto.internal import jobs_pb2, notifications_pb2


def notify(
    content: notifications_pb2.NotificationContent, user_id, topic, key, action, priority=NotificationPriority.normal
):
    """
    Queues a notification given the notification and a target, i.e. a tuple (user_id, topic, key), and an action.

    Notifications are sent to user identified by user_id, and are collapsed/grouped based on the combination of
    (topic, key).

    For example, topic may be "chat" for a group chat/direct message, and the key might be the chat id; so that messages
    in the same group chat show up in one group.

    The action is a simple identifier describing the action that caused the notification. For the above example, the
    action might be "add_admin" if the notification was caused by another user adding an admin into the gorup chat.

    Each different notification type should have its own action.
    """
    with session_scope() as session:
        notification = Notification(
            priority=priority,
            user_id=user_id,
            topic=topic,
            key=key,
            action=action,
            content=content,
        )
        session.add(notification)
        session.flush()
        notification_id = notification.id
    queue_job(
        job_type=BackgroundJobType.handle_notification,
        payload=jobs_pb2.HandleNotificationPayload(
            notification_id=notification_id,
        ),
    )


def easy_notification_formatter(title, message):
    """
    Quick and easy notification content formatter.

    Given just title and message, does some simple formatting to make it OK for most notification formats.
    """
    return notifications_pb2.Notification(
        push_notification_content=notifications_pb2.PushNotificationContent(
            title=self.title,
            preview=self.message[:60],
            content=self.message,
        ),
        email_segment_content=notifications_pb2.EmailSegmentContent(
            title=self.title,
            content=self.message,
        ),
        notification_center_content=notifications_pb2.NotificationCenterContent(
            title=self.title,
            preview=self.message[:60],
            content=self.message,
        ),
    )
