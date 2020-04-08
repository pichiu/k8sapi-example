// tslint:disable:no-console
import * as k8s from '@kubernetes/client-node';

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

const listFn = () => k8sApi.listPersistentVolume();

const informer = k8s.makeInformer(kc, '/api/v1/persistentvolumes', listFn);

informer.on('add', (obj: k8s.V1PersistentVolume) => { console.log(`Added: ${obj.metadata!.name}`); });
informer.on('update', (obj: k8s.V1PersistentVolume) => { console.log(`Updated: ${obj.metadata!.name}`); });
informer.on('delete', (obj: k8s.V1PersistentVolume) => { console.log(`Deleted: ${obj.metadata!.name}`); });
informer.on('error', (err: k8s.V1PersistentVolume) => {
  console.error(err);
  // Restart informer after 5sec
  setTimeout(() => {
    informer.start();
  }, 5000);
});

// informer.on('Pending', (obj: k8s.V1PersistentVolume) => { console.log(`Pending: ${obj.metadata!.name}`); });


informer.start();
