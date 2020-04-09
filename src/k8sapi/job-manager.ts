import k8s = require('@kubernetes/client-node');

export default class K8sJobManager {
    private static sInstance: K8sJobManager;
    private mKc: k8s.KubeConfig;
    private mK8sBatchV1Api: k8s.BatchV1Api;

    private constructor() {
        this.mKc = new k8s.KubeConfig();
        this.mKc.loadFromDefault();

        this.mK8sBatchV1Api = this.mKc.makeApiClient(k8s.BatchV1Api);
    }

    public static getInstance(): K8sJobManager {
        if (!!!K8sJobManager.sInstance) {
            K8sJobManager.sInstance = new K8sJobManager();
        }
        return K8sJobManager.sInstance;
    }

    private newWatch(): k8s.Watch {
        return new k8s.Watch(this.mKc);
    }

    public async createJob({ jobname, namespace = "default", containers, activeDeadlineSeconds, backoffLimit, completions, parallelism, restartPolicy = "Never" }: { jobname: string; namespace: string; containers: Array<k8s.V1Container>; activeDeadlineSeconds?: number; backoffLimit?: number; completions?: number; parallelism?: number; restartPolicy?: string; }) {
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
        return await this.mK8sBatchV1Api.createNamespacedJob(namespace, body);
    }

    public async deleteJobs(jobname: string, namespace: string) {
        try {
            await this.mK8sBatchV1Api.deleteNamespacedJob(jobname, namespace);
        } catch(error) {
            if (error.body.code == 404) {
                //item not found
                console.log("deleteJobs(): item not found");
            } else {
                throw error;
            }
        }
    }

    public async watchJobs(jobname: string, namespace: string) {
        await this.newWatch().watch(`/apis/batch/v1/namespaces/${namespace}/jobs`,
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
                if (obj!.metadata.name === jobname) {
                    console.log("Status: " + JSON.stringify(obj.status, null, 2));
                    if (obj.status.conditions!.find(o => ["Complete","Failed"].includes(o.type))) {
                        this.deleteJobs(jobname, namespace);
                    }
                }
            } else if (type === 'DELETED') {
                // tslint:disable-next-line:no-console
                console.log('deleted object:');
                if (obj!.metadata.name === jobname) {
                    setTimeout((function() {
                        console.log("Exit!")
                        return process.exit(1);
                    }), 5000);
                }
            } else {
                // tslint:disable-next-line:no-console
                console.log('unknown type: ' + type);
            }
        },
        // done callback is called if the watch terminates normally
        (err) => {
            // tslint:disable-next-line:no-console
            console.log(err);
        });
    }
}