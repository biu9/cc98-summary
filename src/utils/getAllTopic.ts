import { API_ROOT,TOPIC_PER_REQUEST,MAX_TOPIC_COUNT } from "../../config";
import { ITopic,IPost } from "@cc98/api";
import { getMarkdownContent } from "./getMarkdonwContent";

/**
 * 转换2018-10-10T01:43:26.11+08:00格式的时间
 * @param time 
 */
const translateTime = (time:string) => {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth()+1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
}

const getTopic = async(from:string,token:string):Promise<ITopic[]> => {
    const res = await fetch(`${API_ROOT}/me/recent-topic?from=${from}&size=${TOPIC_PER_REQUEST}`,{
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
    const data = await res.json();
    return data;
}

const getAllTopic = async (token:string) => {
    const res: ITopic[] = [];
    for(let i=0;i<MAX_TOPIC_COUNT/TOPIC_PER_REQUEST;i++) {
        const data = await getTopic(i*TOPIC_PER_REQUEST+'',token);
        if(data.length === 0) break;
        res.push(...data)
    }
    return res;
}
export default async function getTopicContent(token:string) {
    let message = "";
    const topics = await getAllTopic(token);
    const topicContent = topics.map(async(topic:ITopic) => {
        const tmp = await fetch(`${API_ROOT}/Topic/${topic.id}/post?from=0&size=1`,{
            method: 'GET',
            headers:{ 
              Authorization: `Bearer ${token}`,
            }
        });
        const data = await tmp.json();
        return data[0];
    })
    const topicData = await Promise.all(topicContent);
    topicData.forEach((topic:IPost) => {
        message += translateTime(topic.time)+','+topic.title+','+getMarkdownContent(topic.content)+'||';
    })
    return message;
}