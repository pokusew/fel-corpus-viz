

import argparse
from pathlib import Path
from typing import Optional

import numpy as np
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt

from embeddings import WordEmbeddings, load_glove_word_embeddings


DATA_DIR = Path.cwd() / "data"

if not DATA_DIR.exists():
    DATA_DIR.mkdir(parents=True, exist_ok=True)


class Corpus:
    """Utility class representing a corpus of documents"""

    def __init__(self, name: str, num_docs: int, id_to_word: dict[int, str], docs_data: list[tuple[int, int, int]]):
        self.name = name
        self.num_docs = num_docs
        self.vocab_size = len(id_to_word)
        self.id_to_word = id_to_word
        self.word_to_id = {word: i for i, word in id_to_word.items()}

        # doc_id -> word_id -> count
        self.doc_to_bow: dict[int, dict[int, int]] = {}

        for doc_id, word_id, count in docs_data:
            if doc_id not in self.doc_to_bow:
                self.doc_to_bow[doc_id] = {}
            self.doc_to_bow[doc_id][word_id] = count

    @property
    def vocabulary(self) -> list[str]:
        return list(self.word_to_id)

    @property
    def doc_ids(self) -> list[int]:
        return list(self.doc_to_bow)

    def __len__(self):
        return self.num_docs

    def __getitem__(self, doc_id: int):
        return self.doc_to_bow[doc_id]

    def __iter__(self):
        return iter(self.doc_to_bow.values())

    def __str__(self) -> str:
        return f"Corpus(name={self.name}, num_docs={self.num_docs}, vocab_size={self.vocab_size})"

    def __repr__(self) -> str:
        return str(self)


def load_corpus(corpus_name: str, vocabulary: Optional[set[str]] = None) -> Corpus:
    """Load a corpus from the UCI Bag of Words dataset"""

    def load_corpus_file(filename: str):
        full_path = DATA_DIR / filename
        if not full_path.exists():
            raise FileNotFoundError(
                f"{full_path} does not exist. "
                f"Please download the corpus data from https://archive.ics.uci.edu/ml/datasets/Bag+of+Words"
            )
        return full_path.read_text().splitlines()

    original_vocabulary = load_corpus_file(f"vocab.{corpus_name}.txt")
    lines = load_corpus_file(f"docword.{corpus_name}.txt")

    header, lines = lines[:3], lines[3:]
    num_docs, orig_vocab_size, num_nonzero_counts = map(int, header)

    assert orig_vocab_size == len(original_vocabulary)
    assert num_nonzero_counts == len(lines)

    # words are 1-indexed in the corpus files
    id_to_word = {i: word for i, word in enumerate(original_vocabulary, start=1)}
    if vocabulary is not None:
        # filter out words that are not in the provided vocabulary
        id_to_word = {i: word for i, word in id_to_word.items() if word in vocabulary}
        print(f"Filtered out {orig_vocab_size - len(id_to_word)}/{orig_vocab_size} words from the corpus vocabulary")

    docs_data = []
    for line in lines:
        doc_id, word_id, count = map(int, line.split())
        if word_id in id_to_word:
            docs_data.append((doc_id, word_id, count))

    corpus = Corpus(corpus_name, num_docs, id_to_word, docs_data)
    print(f"Loaded corpus: {corpus}")
    return corpus


def print_missing_words(corpus: Corpus, embeddings: WordEmbeddings):
    missing_embeddings = 0
    for word in corpus.vocabulary:
        if word not in embeddings.word_to_vec_map:
            missing_embeddings += 1
            print(f"Word '{word}' not in embeddings")
    print(f"Missing {missing_embeddings} embeddings out of {len(corpus.vocabulary)} words")


def save_document_embeddings(file: Path, embeddings: np.ndarray, corpus: Corpus):
    """Save document embeddings to a file in the format: doc_id emb_dim_1 emb_dim_2 ... emb_dim_N"""
    with file.open("w") as f:
        for i, doc_id in enumerate(corpus.doc_ids):
            embeddings_str = ' '.join(map(str, embeddings[i]))
            f.write(f"{doc_id} {embeddings_str}\n")

    print(f"Saved document embeddings to {file}")


def scatter_plot(X: np.ndarray, y: np.ndarray, title: str, save: bool = False):
    """Plot the document embeddings in a 2d scatter plot"""

    plt.figure(figsize=(10, 10))
    plt.title(title)
    plt.scatter(X[:, 0], X[:, 1], c=y, cmap='tab10')
    if save:
        plt.savefig(f"{title}.png")
        print(f"Saved plot to {title}.png")
    else:
        plt.show()


def preprocess_using_glove_embeddings(embeddings: WordEmbeddings, corpus: Corpus) -> np.ndarray:
    """
    Preprocess the corpus using the GloVe word embeddings, by averaging the word embeddings weighted by the word count
    """

    X = np.zeros((len(corpus), embeddings.dim))
    for i, doc in enumerate(corpus):
        total_count = sum(doc.values())
        # sum the word embeddings weighted by the word count to get the document embedding
        for word_id, count in doc.items():
            word = corpus.id_to_word[word_id]
            X[i] += embeddings.word_to_vec_map[word] * count
        X[i] /= total_count

    return X


def main(args: argparse.Namespace) -> None:
    """Run the main program"""

    if args.preprocess == "glove":
        word_embeddings = load_glove_word_embeddings(args.glove_file)
        corpus = load_corpus(args.corpus_name, vocabulary=word_embeddings.words)
        print(f"Loaded {len(word_embeddings.words)} embeddings")
        X = preprocess_using_glove_embeddings(word_embeddings, corpus)

    elif args.preprocess == "bow":
        corpus = load_corpus(args.corpus_name)
        X = np.zeros((len(corpus), len(corpus.vocabulary)))
        for i, doc in enumerate(corpus):
            for j, word_id in enumerate(corpus.id_to_word):
                X[i][j] = doc.get(word_id, 0)

    else:
        raise ValueError(f"Unknown preprocessing method: {args.preprocess}")

    if args.method == "pca":
        X_emb = PCA(n_components=2).fit_transform(X)

    elif args.method == "tsne":
        X_emb = TSNE(
            n_components=2,
            learning_rate='auto',
            init='random',
            perplexity=3
        ).fit_transform(X)

    else:
        raise ValueError(f"Unknown method: {args.method}")

    save_document_embeddings(
        file=DATA_DIR / f"doc_embeddings.{args.corpus_name}.txt",
        embeddings=X_emb,
        corpus=corpus
    )

    scatter_plot(
        X=X_emb,
        y=np.zeros(len(corpus)),
        title=f"{args.method.upper()} of {args.preprocess.upper()} embeddings ({args.corpus_name})",
        save=args.save_figure,
    )


if __name__ == "__main__":
    """Usage: python3 main.py --corpus_name kos --preprocess bow --method pca --save_figure"""
    parser = argparse.ArgumentParser()
    parser.add_argument("--corpus_name", type=str, default="kos")
    parser.add_argument("--preprocess", type=str, choices=["bow", "glove"], default="bow")
    parser.add_argument("--glove_file", type=str, default="glove.6B.100d.txt")
    parser.add_argument("--method", type=str, choices=["pca", "tsne"], default="pca")
    parser.add_argument("--save_figure", action="store_true")

    args = parser.parse_args()
    main(args)
