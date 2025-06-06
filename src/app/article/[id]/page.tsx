import { prisma } from "@/lib/prisma"
import ArticlePage from "./article";

export default async function Article({ params }: { params:Promise<{id:string}>}) {
    const {id} = await params;
    const article = await prisma.article.findUnique({ where: { id: id.split('-').pop() }});

    if (!article) {
        return <div className="text-center">Article not found</div>;
    }

    return <ArticlePage article={article} />
}