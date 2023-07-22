export function GET<R>(url:string, token?:string): Promise<R> {
    return new Promise((resolve,reject) => {
        fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                resolve(res)
            })
            .catch(err => {
                reject(err)
            })
    })
}