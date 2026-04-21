import { type FC } from "react";
import { ColorRing, RotatingTriangles, ThreeDots, TailSpin, Puff, Bars, BallTriangle } from "react-loader-spinner";

interface LoadingSpinnerProps {
  variant?: "ring" | "triangles" | "dots" | "tail" | "puff" | "modern" | "pulse" | "bars" | "ball" | "gradient";
  showText?: boolean;
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ variant = "modern", showText = true }) => {
  const renderSpinner = () => {
    switch (variant) {
      case "ring":
        return (
          <ColorRing
            visible={true}
            height="80"
            width="80"
            ariaLabel="color-ring-loading"
            wrapperStyle={{}}
            wrapperClass="color-ring-wrapper"
            colors={['#c9a962', '#b08d4a', '#8f733c', '#c9a962', '#c9a962']}
          />
        );
      
      case "triangles":
        return (
          <RotatingTriangles
            visible={true}
            height="80"
            width="80"
            ariaLabel="rotating-triangles-loading"
            wrapperStyle={{}}
            wrapperClass="rotating-triangles-wrapper"
            colors={['#c9a962', '#0e1a2b', '#f2efe8']}
          />
        );
      
      case "dots":
        return (
          <ThreeDots
            visible={true}
            height="80"
            width="80"
            ariaLabel="three-dots-loading"
            wrapperStyle={{}}
            wrapperClass="three-dots-wrapper"
            color="#c9a962"
          />
        );
      
      case "tail":
        return (
          <TailSpin
            visible={true}
            height="80"
            width="80"
            ariaLabel="tail-spin-loading"
            wrapperStyle={{}}
            wrapperClass="tail-spin-wrapper"
            color="#c9a962"
          />
        );
      
      case "puff":
        return (
          <Puff
            visible={true}
            height="80"
            width="80"
            ariaLabel="puff-loading"
            wrapperStyle={{}}
            wrapperClass="puff-wrapper"
            color="#c9a962"
          />
        );
      
      case "bars":
        return (
          <Bars
            visible={true}
            height="80"
            width="80"
            ariaLabel="bars-loading"
            wrapperStyle={{}}
            wrapperClass="bars-wrapper"
            color="#c9a962"
          />
        );
      
      case "ball":
        return (
          <BallTriangle
            visible={true}
            height="80"
            width="80"
            ariaLabel="ball-triangle-loading"
            wrapperStyle={{}}
            wrapperClass="ball-triangle-wrapper"
            color="#c9a962"
          />
        );
      
      case "modern":
        return (
          <div className="relative">
            <div className="w-20 h-20 border-4 border-[#c9a962]/25 border-t-[#c9a962] rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-[#0e1a2b]/20 border-t-[#0e1a2b] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
            </div>
          </div>
        );
      
      case "pulse":
        return (
          <div className="flex items-center justify-center space-x-2">
            <div 
              className="w-4 h-4 bg-[#c9a962] rounded-full animate-bounce" 
              style={{ animationDelay: '0s', animationDuration: '0.6s' }}
            ></div>
            <div 
              className="w-4 h-4 bg-[#0e1a2b] rounded-full animate-bounce" 
              style={{ animationDelay: '0.2s', animationDuration: '0.6s' }}
            ></div>
            <div 
              className="w-4 h-4 bg-[#c9a962] rounded-full animate-bounce" 
              style={{ animationDelay: '0.4s', animationDuration: '0.6s' }}
            ></div>
          </div>
        );
      
      case "gradient":
        return (
          <div className="relative w-20 h-20">
            <div 
              className="absolute inset-0 rounded-full animate-spin" 
              style={{ 
                background: 'conic-gradient(from 0deg, #c9a962, #0e1a2b, #f2efe8, #c9a962)',
              }}
            ></div>
            <div className="absolute inset-1 rounded-full bg-black/90 dark:bg-gray-900/90"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-[#c9a962] rounded-full animate-pulse"></div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="relative">
            <div className="w-20 h-20 border-4 border-[#c9a962]/25 border-t-[#c9a962] rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-[#0e1a2b]/20 border-t-[#0e1a2b] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-[2147483647]">
      <div className="flex flex-col items-center justify-center space-y-4">
        {renderSpinner()}
        {showText && (
          <p className="text-white dark:text-gray-200 text-sm font-medium mt-4 animate-pulse">Loading...</p>
        )}
      </div>
    </div>
  );
};

const Spin: FC = () => <LoadingSpinner variant="modern" />;

export default Spin;
export { LoadingSpinner };
