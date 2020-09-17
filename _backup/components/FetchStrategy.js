import Storage from './storage';

export default class FetchStrategy {

	static tryToSync() {
		return new Promise((resolve, reject) => {
			Storage.get('offlineTransactions').then(offlineTransactions => {
				if (offlineTransactions.length > 0) {
					const promises = [];
					offlineTransactions.forEach(transaction => {
						const promise = eval(transaction.toString());
						promises.push(promise(...transaction));
						Promise.all(promises).then(() => {
							resolve();
						});
					});
				} else {
					resolve();
				}
			});
		});
	}

	static pushOfflineTransaction(key, promise, data) {
		return Storage.get('offlineTransactions').then(offlineTransactions => {
			return Storage.set('offlineTransactions', offlineTransactions.concat([
				key, promise, data
			]));
		});
	}

	static offlineFirst(key, promise, data) {
		return new Promise((resolve, reject) => {
			FetchStrategy.tryToSync().then(() => {
				Storage.get(key).then(offlineData => {
					promise.then(response => {
						Storage.set(key, response).then(() => {
							resolve(response);
						});
					}).catch(error => {
						if(error.name === 'NetworkError') {
							FetchStrategy.pushOfflineTransaction(key, promise, data).then(() => {
								resolve(offlineData);
							});
						} else {
							reject(error);
						}
					});
				});
			});
		});
	}
}
