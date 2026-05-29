import {setTitleLabel} from "@/lib/Helpers.ts";

interface SearchResultItemProps {
    title: string
    description: string
    url: string
}

export default function SearchResultItem({ title, description, url }: SearchResultItemProps) {
    return (
        <a
            href={url}
            className="block p-4 rounded-lg border border-border hover:bg-card hover:border-primary transition-all duration-200 group"
        >
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary mb-2 transition-colors">{setTitleLabel(title)}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>
            <div className="text-xs text-primary font-medium">{url}</div>
        </a>
    )
}
