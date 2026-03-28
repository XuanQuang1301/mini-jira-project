import { db } from "../db";
import { tasks, subTasks } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
export const updateTaskProgressAuto = async(taskId: number) => {
    const allSubs = await db.select().from(subTasks).where(eq(subTasks.taskId, taskId)); 
    if(allSubs.length === 0 ) return ; 
    const doneCount = allSubs.filter(s => s.isDone).length;
    const percentage = Math.round(doneCount / allSubs.length) * 100; 
    await db.update(tasks).set({progress: percentage}).where(eq(tasks.id, taskId)); 
}
export const getSubTaskService = async(taskId: number) => {
    return await db.select().from(subTasks).where(eq(subTasks.taskId, taskId))
}
export const createSubTaskService  = async (taskId: number, content: string) => {
    const [newSub] = await db.insert(subTasks).values({taskId, content}).returning(); 
    await updateTaskProgressAuto(taskId); 
    return newSub; 
}
export const toggeleSubTaskService = async (id: number, isDone: boolean) => {
    const [updated] = await db.update(subTasks).set({isDone}).where(eq(subTasks.id, id)).returning(); 
    if(updated) await updateTaskProgressAuto(updated.taskId); 
    return updated; 
}
export const deleteSubTaskService = async (id: number)=> {
    const [deleted] = await db.delete(subTasks).where(eq(subTasks.id, id)).returning(); 
    if(deleted) await updateTaskProgressAuto(deleted.taskId); 
    return deleted; 
}