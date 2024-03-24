from channels.generic.websocket import WebsocketConsumer
import json
from asgiref.sync import async_to_sync

class CaseHistoryConsumer(WebsocketConsumer):
    def connect(self):
        self.group_name = 'case_updates'
        async_to_sync(self.channel_layer.group_add)(
            self.group_name,
            self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name,
            self.channel_name
        )

    def case_opened(self, event):
        message = event['data']
        self.send(text_data=json.dumps(message))
