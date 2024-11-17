import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)


class GameRoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.room_code = self.scope['url_route']['kwargs']['code']
            self.room_group_name = f"game_room_{self.room_code}"

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()
            logger.info(f"WebSocket connected to room: {self.room_group_name}")
        except KeyError as e:
            logger.error(f"Error during WebSocket connection: {e}")
            await self.close()

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            logger.info(f"WebSocket disconnected from room: {self.room_group_name}")
        except Exception as e:
            logger.error(f"Error during WebSocket disconnection: {e}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            logger.info(f"Received message type: {message_type} with data: {data}")

            if message_type == 'advance_question':
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'question_advanced',
                        'question_index': data['question_index'],
                    }
                )
                logger.info(f"Broadcasting 'question_advanced' to index: {data['question_index']}")

            elif message_type == 'quiz_finished':
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'quiz_finished',
                    }
                )
                logger.info("Broadcasted 'quiz_finished' to group")

        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
        except Exception as e:
            logger.error(f"Error processing received message: {e}")

    async def question_advanced(self, event):
        try:
            question_index = event['question_index']
            await self.send(text_data=json.dumps({
                'type': 'question_advanced',
                'question_index': question_index,
            }))
            logger.info(f"Sent 'question_advanced' to WebSocket: {question_index}")
        except Exception as e:
            logger.error(f"Error sending 'question_advanced' to WebSocket: {e}")

    async def quiz_finished(self, event):
        try:
            await self.send(text_data=json.dumps({
                'type': 'quiz_finished',
            }))
            logger.info("Sent 'quiz_finished' to WebSocket")
        except Exception as e:
            logger.error(f"Error sending 'quiz_finished' to WebSocket: {e}")
