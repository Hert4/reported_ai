from transformers import AutoModelForCausalLM, AutoTokenizer
import os
from prompt.prompt import SYSTEM_PROMPT
from m_schema.schema_engine import SchemaEngine
import torch
from sqlalchemy import create_engine


SYSTEM_PROMPT = SYSTEM_PROMPT
PATH = os.path.dirname(os.path.abspath(__file__))


class QwenChatbot:
    def __init__(
        self,
        model_name=os.path.join(PATH, "models", "Qwen3-0.6B"),
    ):
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_name, local_files_only=True
        )
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name, local_files_only=True, torch_dtype=torch.float32
        )
        self.history = []

    def generate_response(self, user_input):

        messages = (
            [{"role": "system", "content": SYSTEM_PROMPT}]
            + self.history
            + [{"role": "user", "content": user_input}]
        )

        text = self.tokenizer.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True, enable_thinking=True
        )

        inputs = self.tokenizer(text, return_tensors="pt")
        response_ids = self.model.generate(**inputs, max_new_tokens=1024)[0][
            len(inputs.input_ids[0]) :
        ].tolist()
        response = self.tokenizer.decode(response_ids, skip_special_tokens=True)

        self.history.append({"role": "user", "content": user_input})
        self.history.append({"role": "assistant", "content": response})

        return response
