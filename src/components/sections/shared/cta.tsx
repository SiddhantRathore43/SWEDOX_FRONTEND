import lottieData from "@/assets/lottie/3 cards.json";
import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { AnimateOnView } from "@/components/ui/motion/animate-on-view";
import { StaggerContainer } from "@/components/ui/motion/stagger";
import Lottie from "lottie-react";
import { Link } from "react-router-dom";

const CTA = () => {
    return (
        <section className="relative overflow-hidden pt-20 md:pt-32">
            {/* Background Gradient similar to design (dark with subtle glow) */}
            <div className="absolute inset-0 bg-background" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

            <Container className="relative z-10 space-y-10">
                <StaggerContainer className="text-center">
                    <AnimateOnView
                        blur
                    >
                        <h2
                            className="h2 md:mb-5 mb-3"
                        >
                            Apply in under 10 minutes today!
                        </h2>
                    </AnimateOnView>
                    <AnimateOnView
                        blur
                        delay={0.2}
                    >
                        <p
                            className='text-muted-foreground md:mb-10 mb-5'
                        >
                            Join over 1,000 businesses already benefiting from Swedox.           </p>
                    </AnimateOnView>
                    <AnimateOnView>
                        <Button asChild>
                            <Link to="/contact">
                                Get Started Now
                            </Link>
                        </Button>
                    </AnimateOnView>
                </StaggerContainer>
                <div className="w-full md:h-[288px] h-[140px] max-w-[840px] mx-auto">
                    <div className="aspect-[840/292] w-full">
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
            </Container>
        </section>
    );
};

export default CTA;
