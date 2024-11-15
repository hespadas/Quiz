# quiz/consumers.py

import json

from channels.generic.websocket import AsyncWebsocketConsumer


class GameRoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            print(f"WebSocket connection kwargs: {self.scope['url_route']['kwargs']}")
            self.room_code = self.scope['url_route']['kwargs']['code']
            self.room_group_name = f"game_room_{self.room_code}"

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()
            print(f"WebSocket connected to room: {self.room_group_name}")
        except KeyError as e:
            print(f"Error during WebSocket connection: {e}")
            await self.close()
        except Exception as e:
            print(f"Unexpected error during WebSocket connection: {e}")
            await self.close()

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            print(f"WebSocket disconnected from room: {self.room_group_name}")
        except AttributeError:
            print("Attempted to disconnect without a valid room_group_name.")
        except Exception as e:
            print(f"Error during WebSocket disconnection: {e}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            print(f"Received message type: {message_type} with data: {data}")

            if message_type == 'advance_question':
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'question_advanced',
                        'question_index': data['question_index'],
                    }
                )
                print(f"Broadcasting question advanced to index: {data['question_index']}")
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
        except KeyError as e:
            print(f"Missing key in message data: {e}")
        except Exception as e:
            print(f"Error processing received message: {e}")

    async def question_advanced(self, event):
        try:
            question_index = event['question_index']
            print(f"Sending question advanced event to WebSocket: {question_index}")

            await self.send(text_data=json.dumps({
                'type': 'question_advanced',
                'question_index': question_index,
            }))
        except KeyError as e:
            print(f"Missing key in event data: {e}")
        except Exception as e:
            print(f"Error sending message to WebSocket: {e}")
