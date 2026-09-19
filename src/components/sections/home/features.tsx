import { AnimateOnView } from '@/components/ui/motion/animate-on-view'
import { StaggerContainer } from '@/components/ui/motion/stagger'
import { Link } from 'react-router-dom'
import Container from '../../container'
import { Button } from '../../ui/button'
import {
  FeatureCard,
  FeatureCardAction,
  FeatureCardContent,
  FeatureCardDescription,
  FeatureCardImage,
  FeatureCardOverlay,
  FeatureCardTitle
} from '../../ui/feature-card'

const cards = [
  {
    id: 1,
    title: "Make Smarter Money Decisions Quickly",
    description: "Access real-time analytics and personalized insights to optimize your finances, investments, and business growth effectively.",
    imageSrc: "images/home/feature-1.png",
    imageAlt: "Man using smartphone for financial analytics",
    overlayData: {
      src: "images/home/feature-stat-1.webp",
      alt: "Financial statistics and analytics",
      className: "aspect-[203/188] w-full max-w-[203px]"
    },
    overlayPosition: "bottom-left" as const
  },
  {
    id: 2,
    title: "Make Smarter Money Decisions Quickly",
    description: "Access real-time analytics and personalized insights to optimize your finances, investments, and business growth effectively.",
    imageSrc: "images/home/feature-2.webp",
    imageAlt: "Man using smartphone for financial analytics",
    overlayData: {
      src: "images/home/feature-stat-2.png",
      alt: "Financial statistics and analytics",
      className: "aspect-[244/130] w-full max-w-[244px]"
    },
    overlayPosition: "bottom-left" as const
  },
  {
    id: 3,
    title: "Make Smarter Money Decisions Quickly",
    description: "Access real-time analytics and personalized insights to optimize your finances, investments, and business growth effectively.",
    imageSrc: "images/home/feature-3.webp",
    imageAlt: "Man using smartphone for financial analytics",
    overlayData: {
      src: "images/home/feature-stat-3.png",
      alt: "Financial statistics and analytics",
      className: "aspect-[173/180] w-full max-w-[173px]"
    },
    overlayPosition: "bottom-left" as const
  }
]

const Features = () => {

  return (
    <section className="py-12 md:py-[60px] bg-background">
      <Container className="space-y-8 md:space-y-20">
        <StaggerContainer className="text-center max-w-xl mx-auto">
          <AnimateOnView
            blur
          >
            <h2
              className="h2 mb-6"
            >
              Bank Complete Confidence
            </h2>
          </AnimateOnView>
          <AnimateOnView
            blur
            delay={0.2}
          >
            <p
              className='text-muted-foreground'
            >
              Enjoy high-yield accounts, unlimited 2% cashback cards for Pro customers, and flexible working capital to power your business.
            </p>
          </AnimateOnView>
        </StaggerContainer>
        <StaggerContainer
          className='max-w-[1062px] mx-auto md:space-y-[60px] space-y-8'
        >
          {cards.map((card, index) => (
            <AnimateOnView
              delay={index * 0.1}
              key={card.id}
              className={`md:sticky md:top-24 z-10 bg-background md:rounded-[30px] rounded-lg`}
            >
              <FeatureCard
                imagePosition="right"
              >
                <FeatureCardContent>
                  <FeatureCardTitle>{card.title}</FeatureCardTitle>
                  <FeatureCardDescription>{card.description}</FeatureCardDescription>
                  <FeatureCardAction>
                    <Button asChild>
                      <Link to="/contact">
                        Learn More
                      </Link>
                    </Button>
                  </FeatureCardAction>
                </FeatureCardContent>
                <FeatureCardImage src={card.imageSrc} alt={card.imageAlt}>
                  <FeatureCardOverlay
                    src={card.overlayData.src}
                    alt={card.overlayData.alt}
                    position={card.overlayPosition}
                    className={card.overlayData.className}
                  />
                </FeatureCardImage>
              </FeatureCard>
            </AnimateOnView>
          ))}
        </StaggerContainer>
      </Container>
    </section>
  )
}

export default Features