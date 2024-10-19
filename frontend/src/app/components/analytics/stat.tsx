import { animated, useSpring} from "@react-spring/web";
import { useState, useEffect } from "react";

export function Stat({ title, value, color, total }: { title: string; value: string; color?: string; total?: number }) {
    const numericValue = parseFloat(value);
    const percentage = total ? ((numericValue / total) * 100).toFixed(1) : null;
    const [isVisible, setIsVisible] = useState(false);
  
    useEffect(() => {
      setIsVisible(true);
    }, []);
  
    const props = useSpring({
      number: isVisible ? numericValue : 0,
      from: { number: 0 },
      config: { duration: 300 },
    });
  
    const percentageProps = useSpring({
      number: isVisible && percentage ? parseFloat(percentage) : 0,
      from: { number: 0 },
      config: { duration: 300 },
    });
  
    return (
      <div className={`p-4 ${color ? 'text-white' : 'text-gray-900'} border border-gray-200 rounded-sm relative`} style={{ backgroundColor: color }}>
        <h3 className={`text-sm font-medium ${color ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <animated.p className="mt-2 text-3xl font-semibold">
          {props.number.to(n => Number.isInteger(n) ? Math.floor(n).toString() : n.toFixed(1))}
        </animated.p>
        {percentage && (
          <>
            <animated.span className="absolute bottom-1 right-2 text-xs opacity-90">
              {percentageProps.number.to(n => `${n.toFixed(1)}%`)}
            </animated.span>
          </>
        )}
      </div>
    )
  }