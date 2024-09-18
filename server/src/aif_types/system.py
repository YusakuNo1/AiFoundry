from typing import List
from enum import Enum


class SystemConfig:
    supported_file_exts: List[str]

    def __init__(self, supported_file_exts: List[str]):
        self.supported_file_exts = supported_file_exts
