import lottieData from '@/assets/lottie/confidence.json'
import { Button } from '@/components/ui/button'
import { AnimateOnView } from '@/components/ui/motion/animate-on-view'
import { StaggerContainer } from '@/components/ui/motion/stagger'
import Lottie from 'lottie-react'
import { Link } from 'react-router-dom'
import Container from '../../container'

const Confidence = () => {
  return (
    <section
      className="relative bg-background overflow-hidden lg:pt-[218px] lg:pb-[291px] md:pt-[60px] md:pb-[60px] pt-12 pb-12">
      {/* Lottie Background */}
      <div className="absolute inset-x-0 top-0 z-0 pointer-events-none md:block hidden">
        <div className='max-w-[1440px] mx-auto aspect-[1200/650] w-full'>
          <Lottie
            animationData={lottieData}
            loop={true}
            className="w-full h-full"
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </div>
      </div>

      {/* Content */}
      <Container className="relative z-10">
        <StaggerContainer className="text-center max-w-[600px] mx-auto">
          <AnimateOnView
            blur
          >
            <h2
              className="h2 md:mb-5 mb-3"
            >
              Who Says a Banking Platform Can't Blow Mind?
            </h2>
          </AnimateOnView>
          <AnimateOnView
            blur
            delay={0.2}
          >
            <p
              className='text-muted-foreground md:mb-10 mb-5'
            >
              We care a lot. And you’ll feel it in everything we do. With Rho, feel seen & taken care of across every step of the startup journey (not just your finances).            </p>
          </AnimateOnView>
          <AnimateOnView>
            <Button asChild>
              <Link to="/contact">
                Get Started
              </Link>
            </Button>
          </AnimateOnView>
        </StaggerContainer>
      </Container>
    </section>
  )
}

export default Confidence

