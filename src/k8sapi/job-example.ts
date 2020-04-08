import k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sBatchV1Api = kc.makeApiClient(k8s.BatchV1Api);

async function getJobs(namespace = "default") {
    return await k8sBatchV1Api.listNamespacedJob(namespace);
}

function getContainer(name: string, image: string, command: Array<string>): k8s.V1Container {
    return {
        name: name,
        image: image,
        command: command
    } as k8s.V1Container
}

async function createJob({ jobname, namespace = "default", containers, activeDeadlineSeconds, backoffLimit, completions, parallelism, restartPolicy = "Never" }: { jobname: string; namespace: string; containers: Array<k8s.V1Container>; activeDeadlineSeconds?: number; backoffLimit?: number; completions?: number; parallelism?: number; restartPolicy?: string; }) {
    let body = {
        apiVersion: "batch/v1",
        kind: "Job",
        metadata: {
            name: jobname
        } as k8s.V1ObjectMeta,
        spec: {
            activeDeadlineSeconds: activeDeadlineSeconds,
            backoffLimit: backoffLimit,
            completions: completions,
            parallelism: parallelism,
            template: {
                spec: {
                    containers: containers,
                    restartPolicy: restartPolicy
                } as k8s.V1PodSpec
            } as k8s.V1PodTemplateSpec
        } as k8s.V1JobSpec
    } as k8s.V1Job;
    return await k8sBatchV1Api.createNamespacedJob(namespace, body);
}

const simpleContainer = getContainer("counter", "busybox", ["bin/sh", "-c", "for i in 9 8 7 6 5 4 3 2 1 ; do echo $i ; done"]);
const consumerContainer = getContainer("consumer", "busybox", ["bin/sh", "-c", "echo 'consuming a message'; sleep $(shuf -i 5-10 -n 1)"]);
const interruptContainer = getContainer("interrupt", "busybox", ["bin/sh",  "-c", "echo 'Consuming data'; sleep 1; exit 1"]);

// createJob({
//     jobname: "simple",
//     namespace: "test",
//     containers: [simpleContainer]
// })

// createJob({
//     jobname: "parallelism",
//     namespace: "test",
//     containers: [consumerContainer],
//     parallelism: 5,
//     restartPolicy: "OnFailure"
// })

createJob({
    jobname: "deadline",
    namespace: "test",
    containers: [interruptContainer],
    backoffLimit: 5,
    activeDeadlineSeconds: 20,
    restartPolicy: "OnFailure"
})