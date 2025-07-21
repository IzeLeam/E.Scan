export default function ProgressBar({ progress }: { progress: number }) {
  const safeProgress = Math.max(0, Math.min(progress, 100));
  return (
    <>
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-blue-700 dark:text-white">Progression</span>
        <span className="text-sm font-medium text-blue-700 dark:text-white">{safeProgress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${safeProgress}%` }}></div>
      </div>
    </>
  );
}
