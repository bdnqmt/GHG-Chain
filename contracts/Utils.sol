// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;
//pragma experimental SMTChecker;/

import "../node_modules/@openzeppelin/contracts/utils/math/Math.sol";
import "../node_modules/@openzeppelin/contracts/utils/Strings.sol";

library Utils {
    
    function abs(int x)
    internal pure returns (uint) {
        return x >= 0 ? uint(x) : uint(-x);
    }

    function calcStocastic(uint[] memory data, uint historylength)
    internal pure returns(bool, uint, uint)
    {    
        
        if (data.length > 0) {
            uint average = 0;
            uint i = data.length;            
            uint count = 0;        
            while(count < historylength && i > 0) {
                count +=1;
                i -=1;
                average += data[i];
            }
            average = average/count;
            uint stdDev = 0;
            i = data.length;            
            count = 0;        
            while(count < historylength && i > 0) {
                count +=1;
                i -=1;
                unchecked {
                    uint diff = abs(int(data[i] - average));
                    stdDev += diff * diff;
                }                
            }
            stdDev = Math.sqrt(stdDev/count, Math.Rounding.Up);
            return (true, uint(average), uint(stdDev));
        } else {
            return (false, 0, 0);
        }        
    }
    
    function orderedUintListRemove(uint needle, uint[] storage haystack)
    internal {
        (bool found, uint index) = uintListFindIndex(needle, haystack);
        haystack.pop();
        if (found) {
            for (uint i = index; i < haystack.length; i++) {
                haystack[i] = haystack[i+1];
            }
            haystack.pop();
        }
    }
    
    function sqrt(uint y)
    internal pure returns (uint) {        
        uint z = 0;
        if (y > 3) {            
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
        return z;
    }
    
    function stringsEqual(string memory a, string memory b)
    internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }

    function stringListExists(string memory needle, string[] memory haystack)
    internal pure returns (bool) {
       (bool found,) = stringListFindIndex(needle, haystack);
       return found;
    }

    function stringListFindIndex(string memory needle, string[] memory haystack)
    internal pure returns (bool, uint) {
       for (uint i = 0; i < haystack.length; i++) {
           if (stringsEqual(haystack[i], needle)) {
                return (true, i);
           }
       }
       return (false, 0);
    }

    function stringListRemove(string memory needle, string[] storage haystack)
    internal {
        (bool found, uint index) = stringListFindIndex(needle, haystack);        
        if (found) {
            haystack[index] = haystack[haystack.length - 1];
            haystack.pop();
        }        
    }

    function uintListFindIndex(uint needle, uint[] memory haystack)
    internal pure returns (bool, uint) {
       for (uint i = 0; i < haystack.length; i++) {
            if (haystack[i] == needle) {
                return (true, i);
            }
       }
       return (false, 0);
    }
        
}