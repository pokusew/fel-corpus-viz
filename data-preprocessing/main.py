

import argparse
import itertools
from functools import cached_property
from pathlib import Path
from typing import Optional

import numpy as np
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt

from embeddings import WordEmbeddings, load_glove_word_embeddings
from pca import pca_transform


DATA_DIR = Path.cwd() / "data"
IMAGE_DIR = DATA_DIR / "images"

if not IMAGE_DIR.exists():
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)


class Corpus:
    """Utility class representing a corpus of documents"""

    def __init__(self, name: str, num_docs: int, id_to_word: dict[int, str], docs_data: list[tuple[int, int, int]]):
        self.name = name
        self.num_docs = num_docs
        self.vocab_size = len(id_to_word)
        self.id_to_word = id_to_word
        self.id_to_vocab_idx = {word_id: i for i, word_id in enumerate(id_to_word)}
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

    @cached_property
    def idf_vector(self) -> np.ndarray:
        """Compute the inverse document frequency for each word in the corpus"""
        # compute the document frequency for each word
        doc_freq = np.zeros(self.vocab_size, dtype=np.int32)
        for doc_bow in self.doc_to_bow.values():
            for word_id in doc_bow:
                doc_freq[self.id_to_vocab_idx[word_id]] += 1

        assert np.all(doc_freq > 0)

        # compute the inverse document frequency
        return np.log(self.num_docs / doc_freq)

    @cached_property
    def document_term_matrix(self) -> np.ndarray:
        """Compute the document-term matrix for the corpus"""
        # create the document-term matrix
        dtm = np.zeros((self.num_docs, self.vocab_size), dtype=np.float32)
        for doc_idx, doc_bow in enumerate(self):
            for word_id, count in doc_bow.items():
                word_idx = self.id_to_vocab_idx[word_id]
                dtm[doc_idx, word_idx] = count
        return dtm

    @cached_property
    def tfidf_matrix(self) -> np.ndarray:
        """Compute the TF-IDF matrix for the corpus"""
        return self.document_term_matrix * self.idf_vector

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

    seen_word_ids = set()
    docs_data = []
    for line in lines:
        doc_id, word_id, count = map(int, line.split())
        if word_id in id_to_word:
            docs_data.append((doc_id, word_id, count))
            seen_word_ids.add(word_id)

    # in some corpora, the vocabulary contains words that are not present in any document
    # e.g. [6149, 8416, 15618] in the enron corpus
    # we filter out these words from the vocabulary
    print(f"Filtered out {len(id_to_word) - len(seen_word_ids)}/{len(id_to_word)} words from the corpus vocabulary")
    id_to_word = {i: word for i, word in id_to_word.items() if i in seen_word_ids}

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
        path = IMAGE_DIR / f"{title.replace(' ', '_')}.png"
        plt.savefig(path)
        print(f"Saved plot to {path}")
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


def run_data_preprocessing(
    corpus_name: str,
    reduction_method: str,
    preprocess_method: str,
    glove_file: Optional[str] = None,
    save_figure: bool = False,
) -> None:
    """Run the main program"""

    if preprocess_method == "glove":
        word_embeddings = load_glove_word_embeddings(glove_file)
        corpus = load_corpus(corpus_name, vocabulary=word_embeddings.words)
        print(f"Loaded {len(word_embeddings.words)} embeddings")
        X = preprocess_using_glove_embeddings(word_embeddings, corpus)

    elif preprocess_method == "bow":
        corpus = load_corpus(corpus_name)
        X = corpus.document_term_matrix

    elif preprocess_method == "tfidf":
        corpus = load_corpus(corpus_name)

        # note: we use a slightly different implementation than the one in sklearn that doesn't add 1 to the idf
        # X = TfidfTransformer(norm=None).fit_transform(X).toarray()
        X = corpus.tfidf_matrix

    else:
        raise ValueError(f"Unknown preprocessing method: {preprocess_method}")

    print(f"Preprocessed corpus using {preprocess_method} method")

    if reduction_method == "pca":
        # the sklearn implementation of PCA is much faster than ours because it uses randomized SVD
        X_emb = PCA(n_components=2).fit_transform(X)
        # X_emb = pca_transform(X, num_components=2)

    elif reduction_method == "tsne":
        X_emb = TSNE(
            n_components=2,
            learning_rate='auto',
            init='random',
            perplexity=3
        ).fit_transform(X)

    else:
        raise ValueError(f"Unknown method: {reduction_method}")

    print(f"Reduced corpus using {reduction_method} method")

    save_document_embeddings(
        file=DATA_DIR / f"embeddings.{preprocess_method}.{reduction_method}.{corpus_name}.txt",
        embeddings=X_emb,
        corpus=corpus
    )

    scatter_plot(
        X=X_emb,
        y=np.zeros(len(corpus)),
        title=f"[{corpus_name}] {reduction_method.upper()} embeddings of {preprocess_method.upper()} vectors",
        save=save_figure,
    )


def main() -> None:
    """
    Usage examples:
    $ python3 main.py --corpus_name kos --preprocess bow --method pca --save_figure
    $ python3 main.py --corpus_name kos --all
    """

    parser = argparse.ArgumentParser()
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--corpus_name", type=str, default="kos")
    parser.add_argument("--preprocess", type=str, choices=["bow", "glove", "tfidf"], default="bow")
    parser.add_argument("--glove_file", type=str, default="glove.6B.100d.txt")
    parser.add_argument("--method", type=str, choices=["pca", "tsne"], default="pca")
    parser.add_argument("--save_figure", action="store_true")

    args = parser.parse_args()

    if args.all:
        # we leave out glove preprocessing since it doesn't give good results
        for reduction_method, preprocess_method in itertools.product(["pca", "tsne"], ["bow", "tfidf"]):
            run_data_preprocessing(
                corpus_name=args.corpus_name,
                reduction_method=reduction_method,
                preprocess_method=preprocess_method,
                glove_file=args.glove_file,
                save_figure=False,
            )
    else:
        run_data_preprocessing(
            corpus_name=args.corpus_name,
            reduction_method=args.method,
            preprocess_method=args.preprocess,
            glove_file=args.glove_file,
            save_figure=args.save_figure,
        )


if __name__ == "__main__":
    main()
