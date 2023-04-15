from pathlib import Path
import pickle
from typing import NamedTuple

import numpy as np


EMBEDDINGS_DIR = Path.cwd() / "data" / "embeddings"


class WordEmbeddings(NamedTuple):
    words: set[str]
    word_to_vec_map: dict[str, np.ndarray]
    dim: int


def load_glove_word_embeddings(glove_file: str) -> WordEmbeddings:
    processed_file = EMBEDDINGS_DIR / f"{glove_file}.processed"
    if not processed_file.exists():
        raw_embeddings_file = EMBEDDINGS_DIR / glove_file
        if not raw_embeddings_file.exists():
            raise FileNotFoundError(
                f"{raw_embeddings_file} does not exist. "
                f"Please download the embeddings from https://nlp.stanford.edu/data/glove.6B.zip"
            )
        print(f"Processing embeddings from {raw_embeddings_file}...")
        embeddings = _preprocess_embeddings(raw_embeddings_file)
        print(f"Saving processed embeddings to {processed_file}...")
        with processed_file.open("wb") as out:
            pickle.dump(embeddings, out)

    with processed_file.open("rb") as inp:
        words, word_to_vec_map = pickle.load(inp)
        dim = len(next(iter(word_to_vec_map.values())))
        return WordEmbeddings(words, word_to_vec_map, dim)


def _preprocess_embeddings(source_file: Path) -> tuple[set[str], dict[str, np.ndarray]]:
    words = set()
    word_to_vec_map = {}
    with source_file.open("r", encoding="utf-8") as f:
        while (line := f.readline()) is not None and line != "":
            word, *vec = line.split()
            words.add(word)
            word_to_vec_map[word] = np.array([float(x) for x in vec])

    return words, word_to_vec_map
