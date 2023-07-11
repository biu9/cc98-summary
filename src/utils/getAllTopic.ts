import { API_ROOT,TOPIC_PER_REQUEST,MAX_TOPIC_COUNT } from "../../config";

const getTopic = async(from:string,token:string):Promise<any[]> => {
    const res = await fetch(`${API_ROOT}/topic?from=${from}&size=${TOPIC_PER_REQUEST}`,{
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
    const data = await res.json();
    return data;
}

const getAllTopic = async (token:string) => {
    const res: any[] = [];
    for(let i=0;i<MAX_TOPIC_COUNT/TOPIC_PER_REQUEST;i++) {
        const data = await getTopic(i*TOPIC_PER_REQUEST+'',token);
        if(data.length === 0) break;
        res.concat(data);
    }
    return res;
}
export default async function getTopicContent(token:string) {
    let message = "";
    const topics = await getAllTopic(token);
    const topicContent = topics.map(async(topic:any) => {
        const tmp = await fetch(`${API_ROOT}/topic/${topic.id}/post?from=0&size=1`,{
            method: 'GET',
            headers:{ 
              Authorization: `Bearer ${token}`,
            }
        });
        const data = await tmp.json();
        return data[0];
    })
    const topicData = await Promise.all(topicContent);
    topicData.forEach((topic:any) => {
        message += topic.title+topic.content;
    })
    return message;
}