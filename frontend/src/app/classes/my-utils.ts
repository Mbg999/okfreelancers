export class MyUtils {

  /**
   * Used for get the difference between 2 arrays
   * 
   * https://stackoverflow.com/a/21988185
   * 
   * @param otherArray any[]
   */
  public static comparer(otherArray: any[]): any{
    return function(current: any){
      return otherArray.filter(function(other:any){
        return other.id == current.id 
      }).length == 0;
    }
  }
}