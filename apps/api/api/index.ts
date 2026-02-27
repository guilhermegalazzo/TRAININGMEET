import { bootstrapApp } from '../src/main';

export default async (req: any, res: any) => {
    const app = await bootstrapApp();
    const instance = app.getHttpAdapter().getInstance();
    return instance(req, res);
};
