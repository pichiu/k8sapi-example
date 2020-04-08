import * as k8s from '@kubernetes/client-node';

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const watch = new k8s.Watch(kc);

async function watchJobs(namespace: string) {
    await watch.watch(`/apis/batch/v1/namespaces/${namespace}/jobs`,
    // optional query parameters can go here.
    {},
    // callback is called for each received object.
    (type, obj: k8s.V1Job) => {
        if (type === 'ADDED') {
            // tslint:disable-next-line:no-console
            console.log('new object:');
        } else if (type === 'MODIFIED') {
            // tslint:disable-next-line:no-console
            console.log('changed object:');
        } else if (type === 'DELETED') {
            // tslint:disable-next-line:no-console
            console.log('deleted object:');
        } else {
            // tslint:disable-next-line:no-console
            console.log('unknown type: ' + type);
        }
        // tslint:disable-next-line:no-console
        // console.log("Name: " + obj!.metadata.name);
        // console.log("Status: " + obj!.status);
        console.log(JSON.stringify(obj, null, 2));
    },
    // done callback is called if the watch terminates normally
    (err) => {
        // tslint:disable-next-line:no-console
        console.log(err);
    });
}

watchJobs("test");