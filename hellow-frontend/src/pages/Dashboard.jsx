import { MicroLearningCard } from '../components/dashboard/MicroLearningCard'
import { NewsFeed } from '../components/dashboard/NewsFeed'

export function Dashboard() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <MicroLearningCard />
      <NewsFeed />
    </div>
  )
}
