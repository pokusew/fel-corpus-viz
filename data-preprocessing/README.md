# Data preprocessing

The data preprocessing is done in Python 3.9 and all the scripts are part of this directory.

To run the current version of the preprocessing pipeline:

1. Change into this directory (the `data-preprocessing` dir): `cd data-preprocessing`
2. Download the data of some corpus from [here](https://archive.ics.uci.edu/ml/datasets/Bag+of+Words).
3. Create and activate a new virtual environment (optional).
4. Install the dependencies using [Poetry] (`poetry install`) or [pip] (`python -m pip install .`) 
5. Run the [main.py](./main.py) script, for example like this:
```bash
python main.py --corpus_name kos --preprocess bow --method pca --save_figure
```

Note: The file [pca.py](./pca.py) contains our own PCA implementation.


<!-- links references -->

[Poetry]: https://python-poetry.org/

[pip]: https://pypi.org/project/pip/
