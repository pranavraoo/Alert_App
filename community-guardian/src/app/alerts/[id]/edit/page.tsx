export default function EditAlertPage({ params }: { params: { id: string } }) {
    return <div className="text-slate-600 dark:text-slate-400">Edit {params.id}</div>
}