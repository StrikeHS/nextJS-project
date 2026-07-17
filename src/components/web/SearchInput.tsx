import { Loader2, Search } from "lucide-react";
import { Input } from "../ui/input";
import { useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import Link from "next/link";

export default function SearchInput() {
  const [value, setValue] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);

  const results = useQuery(
    api.posts.searchPost,
    value.length > 2 ? { limit: 5, term: value } : "skip",
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setOpenDropdown(true);
  };

  return (
    <div className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search post"
          className="w-full pl-8 bg-background"
          value={value}
          onChange={onChange}
        />
      </div>
      {openDropdown && value.length > 2 && (
        <div className="absolute z-10 top-full mt-2 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
          {results === undefined ? (
            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" /> Searching...
            </div>
          ) : results.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">
              No results found
            </p>
          ) : (
            <div className="py-1">
              {results.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post._id}`}
                  className="flex flex-col px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  onClick={() => {
                    setOpenDropdown(false);
                    setValue("");
                  }}
                >
                  <p className="font-medium truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground pt-1">
                    {post.content.substring(0, 60)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
