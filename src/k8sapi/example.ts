import K8sJobManager from "./job-manager";
import { V1Container } from '@kubernetes/client-node';

function getContainer(name: string, image: string, command: Array<string>): V1Container {
    return {
        name: name,
        image: image,
        command: command
    } as V1Container;
}
class Job {
    name: string;
    namespace: string;
    containers: Array<V1Container>;

    constructor({ name, namespace, containers }: { name: string; namespace: string; containers: Array<V1Container>; }) {
        this.name = name;
        this.namespace = namespace;
        this.containers = containers;
    }
}

async function testJob(job: Job) {
    K8sJobManager.getInstance().createJob({
        jobname: job.name,
        namespace: job.namespace,
        containers: job.containers
    })
    .then(() => {
        K8sJobManager.getInstance().watchJobs(job.name, job.namespace);
    });
}

const simpleJob = new Job({
    name: "simple",
    namespace: "test",
    containers: [getContainer("counter", "busybox", ["bin/sh", "-c", "for i in 9 8 7 6 5 4 3 2 1 ; do echo $i ; done"])]
});

testJob(simpleJob);