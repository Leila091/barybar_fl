import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadDir = path.join(process.cwd(), "public/uploads");

        // Проверяем, существует ли директория, и создаем её, если не существует
        await fs.mkdir(uploadDir, { recursive: true });

        const uploadPath = path.join(uploadDir, file.name);

        // Записываем файл асинхронно
        await fs.writeFile(uploadPath, buffer);

        return NextResponse.json({ photoUrl: `/uploads/${file.name}` });
    } catch (error) {
        console.error("Ошибка при загрузке файла:", error);
        return NextResponse.json({ error: "Ошибка при загрузке файла" }, { status: 500 });
    }
}