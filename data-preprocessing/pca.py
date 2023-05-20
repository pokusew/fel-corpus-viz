import numpy as np


def pca_transform(data: np.ndarray, num_components: int) -> np.ndarray:
    # standardize the data
    mean = np.mean(data, axis=0)
    std_dev = np.std(data, axis=0)
    data = (data - mean) / std_dev

    # calculate the covariance matrix
    print("Calculating covariance matrix...")
    cov_matrix = np.cov(data.T)

    # compute the eigenvalues and eigenvectors
    print("Calculating eigenvalues and eigenvectors...")
    eigen_vals, eigen_vecs = np.linalg.eigh(cov_matrix)
    # eigen_vals, eigen_vecs = eigh(cov_matrix)

    # sort the eigen_vecs by decreasing eigen_vals
    indices = np.argsort(eigen_vals)[::-1]
    eigen_vecs_sorted = eigen_vecs[:, indices]

    # choose the first num_components eigen_vecs
    eigen_vecs_k = eigen_vecs_sorted[:, :num_components]

    # transform the original dataset
    return data.dot(eigen_vecs_k)
