import {sqliteTable,text,integer,index,uniqueIndex,check} from 'drizzle-orm/sqlite-core';
import {sql} from 'drizzle-orm';
export const applications=sqliteTable('applications',{
 id:text('id').primaryKey(), userId:text('user_id').notNull(), name:text('name').notNull(), email:text('email').notNull(), program:text('program').notNull(), status:text('status').notNull().default('UNDER REVIEW'), payload:text('payload').notNull(), payloadHash:text('payload_hash').notNull(), submittedAt:text('submitted_at').notNull(), updatedAt:text('updated_at').notNull(), revision:integer('revision').notNull().default(0)
},t=>[index('applications_status_date').on(t.status,t.submittedAt),index('applications_date').on(t.submittedAt),check('application_program',sql`${t.program} IN ('SPARK','IGNITE')`),check('application_status',sql`${t.status} IN ('NEW','UNDER REVIEW','SHORTLISTED','ACCEPTED','WAITLISTED','REJECTED')`)]);
export const applicationEvents=sqliteTable('application_events',{
 id:text('id').primaryKey(), applicationId:text('application_id').notNull().references(()=>applications.id), status:text('status').notNull(), actor:text('actor').notNull(), createdAt:text('created_at').notNull(), revision:integer('revision').notNull()
},t=>[uniqueIndex('application_events_revision').on(t.applicationId,t.revision)]);
