import { HeroSlider } from '@/components/home/HeroSlider'
import { FeaturedLessons } from '@/components/home/FeaturedLessons'
import { WhyLearnFromLife } from '@/components/home/WhyLearnFromLife'
import { TopContributors } from '@/components/home/TopContributors'
import { MostSavedLessons } from '@/components/home/MostSavedLessons'

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <FeaturedLessons />
      <WhyLearnFromLife />
      <TopContributors />
      <MostSavedLessons />
    </>
  )
}
