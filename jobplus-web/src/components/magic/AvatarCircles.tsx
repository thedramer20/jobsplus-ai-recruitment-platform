interface AvatarCirclesProps {
  avatarUrls: { imageUrl: string; profileUrl?: string }[]
  numPeople?: number
  className?: string
}

export function AvatarCircles({ avatarUrls, numPeople, className = '' }: AvatarCirclesProps) {
  return (
    <div className={`flex -space-x-3 ${className}`}>
      {avatarUrls.slice(0, 5).map((avatar, i) =>
        avatar.profileUrl ? (
          <a key={i} href={avatar.profileUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={avatar.imageUrl}
              alt=""
              className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-slate-900"
            />
          </a>
        ) : (
          <img
            key={i}
            src={avatar.imageUrl}
            alt=""
            className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-slate-900"
          />
        )
      )}
      {numPeople !== undefined && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-medium text-slate-600 dark:border-slate-900 dark:bg-slate-700 dark:text-slate-300">
          +{numPeople}
        </div>
      )}
    </div>
  )
}
