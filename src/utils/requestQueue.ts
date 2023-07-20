import { MAX_CONCURRENCY } from "../../config";
/**
 * 并发控制请求函数,一次最多max个请求
 * @param requests 
 * @param max 
 */
export function requestQueue(requests: any[], max:number=MAX_CONCURRENCY) {
    return new Promise((resolve,reject) => {
        const tasks = [...requests];
        const res: any = [];
        let running = 0;

        const runTask = async () => {
            if(tasks.length === 0) {
                if(running === 0) {
                    resolve(res);
                }
            } else {
                const task = tasks.shift();
                running++;
                const data = await task();
                running--;
                res.push(data);
                runTask();
            }
        }

        for(let i=0;i<max;i++) {
            runTask();
        }
    })
}