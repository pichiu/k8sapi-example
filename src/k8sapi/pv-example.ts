import k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);

async function getPV() {
    return await k8sCoreV1Api.listPersistentVolume();
}

async function createPV({ pvname, storageclass = "manual", accessmode = "ReadWriteOnce", storagecapacity = "2Gi", hostpath = "/mnt/data" }: { pvname: string; storageclass?: string; accessmode?: string; storagecapacity?: string; hostpath?: string; }) {
    let body = {
        apiVersion: "v1",
        kind: "PersistentVolume",
        metadata: {
            name: pvname
        } as k8s.V1ObjectMeta,
        spec: {
            storageClassName: storageclass,
            accessModes: [accessmode],
            capacity: {
                "storage": storagecapacity
            },
            hostPath: {
                path: hostpath
            } as k8s.V1HostPathVolumeSource
        } as k8s.V1PersistentVolumeSpec
    } as k8s.V1PersistentVolume;
    return await k8sCoreV1Api.createPersistentVolume(body)
}

async function createPVC({ pvcname, namespace = "default", storageclass = "manual", accessmode = "ReadWriteOnce", capacity = "1Gi" }: { pvcname: string; namespace?: string; storageclass?: string; accessmode?: string; capacity?: string; }) {
    let body = {
        apiVersion: "v1",
        kind: "PersistentVolumeClaim",
        metadata: {
            name: pvcname,
            namespace: namespace
        } as k8s.V1ObjectMeta,
        spec: {
            storageClassName: storageclass,
            accessModes: [accessmode],
            resources: {
                requests: {
                    storage: capacity
                }
            }
        } as k8s.V1PersistentVolumeClaimSpec
    } as k8s.V1PersistentVolumeClaim;
    return await k8sCoreV1Api.createNamespacedPersistentVolumeClaim(namespace, body)
}

// getPV().then((res) => console.log(JSON.stringify(res.body.items, null, 2)));
createPV({ pvname: "api-create-volume" }).then((res) => console.log(JSON.stringify(res.body, null, 2)));
createPVC({ pvcname: "api-create-claim", namespace: "test" }).then((res) => console.log(JSON.stringify(res.body, null, 2)));
// getPV().then((res) => console.log(JSON.stringify(res.body.items, null, 2)));