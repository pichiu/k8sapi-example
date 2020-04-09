import K8sJobManager, { K8sJob } from "./job-manager";

async function testJob(job: K8sJob) {
    K8sJobManager.getInstance().createJob(job)
    .then(() => {
        K8sJobManager.getInstance().watchJobs(job);
    });
}

testJob({
    name: "simple",
    namespace: "test",
    containers: [{
        name: "counter",
        image: "busybox",
        command: ["bin/sh", "-c", "for i in 9 8 7 6 5 4 3 2 1 ; do echo $i ; done"]
    }],
    restartPolicy: "Never"
});

// testJob({
//     name: "deadline",
//     namespace: "test",
//     containers: [{
//         name: "interrupt",
//         image: "busybox",
//         command: ["bin/sh", "-c", "echo 'Consuming data'; sleep 1; exit 1"]
//     }],
//     backoffLimit: 5,
//     activeDeadlineSeconds: 20,
//     restartPolicy: "OnFailure"
// });